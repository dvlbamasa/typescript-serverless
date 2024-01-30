class User {
    constructor(public username: string, 
        public email: string, 
        public password: string) {}
}

export const defaultUser = new User ('test-username', 'test-email', 'test-password');

export const saveUser = (username: string, email: string, password: string) => {
    return new User (username, email, password);
}


export const getUsers = () => {
    return defaultUser;
}
