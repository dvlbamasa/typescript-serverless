provider "aws" {
  region     = "us-east-1"
  #attach here your access_key and secret_key of your AWS personal account
}

resource "aws_dynamodb_table" "basic-dynamodb-table" {
  name           = "match-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  range_key      = "sk"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "data"
    type = "S"
  }

  global_secondary_index {
    name               = "sort_key-data-index"
    hash_key           = "sk"
    range_key          = "data"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "ALL"
  }
}

resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  path        = "/"
  description = "Lambda to dynamodb"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:*"
        ]
        Effect   = "Allow"
        Resource = [aws_dynamodb_table.basic-dynamodb-table.arn, "${aws_dynamodb_table.basic-dynamodb-table.arn}/index/*"]
      }
    ]
  })
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_dynmodb_role" {
  name               = "lambda_dynmodb_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "dynmodb_role_policy_attach" {
  role       = aws_iam_role.lambda_dynmodb_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_basic_policy_attach" {
  role       = aws_iam_role.lambda_dynmodb_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir = "${path.module}/../dist/"
  output_path = "${path.module}/../dist/index.zip"
}


resource "aws_lambda_function" "terraform_lambda" {
  filename      = "${path.module}/../dist/index.zip"
  function_name = "terraform_lambda"
  role          = aws_iam_role.lambda_dynmodb_role.arn
  handler       = "index.handler"

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = "nodejs20.x"
}

resource "aws_apigatewayv2_api" "example" {
  name          = "lambda-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "example" {
  api_id = aws_apigatewayv2_api.example.id
  name   = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "example" {
  api_id           = aws_apigatewayv2_api.example.id
  integration_type = "AWS_PROXY"

  description               = "Lambda example"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.terraform_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "example" {
  api_id    = aws_apigatewayv2_api.example.id
  route_key = "ANY /{proxy+}"

  target = "integrations/${aws_apigatewayv2_integration.example.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.terraform_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.example.execution_arn}/*/*/{proxy+}"
}