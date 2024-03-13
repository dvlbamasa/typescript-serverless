/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
	transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx'],
  testMatch: ["**/?(*.)+(spec|test).js"]
};