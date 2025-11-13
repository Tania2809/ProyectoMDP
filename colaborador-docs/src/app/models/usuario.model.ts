export type UserStatus = 'online' | 'offline' | 'idle' | 'typing';

export interface User {
	id: number;
	name: string;
	status?: UserStatus;
}

// small helper to create users
export const createUser = (id: number, name: string, status: UserStatus = 'online'): User => ({ id, name, status });
