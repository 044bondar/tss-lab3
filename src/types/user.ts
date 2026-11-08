export interface UserLocation {
    city: string;
    country: string;
}

export interface UserName {
    first: string;
    last: string;
}

export interface UserDob {
    date: string;
    age: number;
}

export interface User {
    id: number;
    gender: 'male' | 'female';
    name: UserName;
    location: UserLocation;
    email: string;
    phone: string;
    picture: string;
    dob: UserDob;
    hobbies: string[];
    details: string;
}