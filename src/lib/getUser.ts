import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export interface User {
  id: string;
  name: string;
  email: string;
  level: MembershipLevel;
}

export enum MembershipLevel {
  Free = 'free',
  Level1 = 'level1',
  Level2 = 'level2',
  Level3 = 'level3',
  Admin = 'admin',
}

export interface Membership {
  level_id: string;
  level_slug: string;
  label: string;
  expire_time: string;
  is_expired: boolean;
}

export interface TokenPayload {
  data: {
    user: User;
    membership: Membership[];
  }
}

const formatName = (name: string): string => {
  const nameParts = name.split(' ');
  const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  return formattedName;
}

export const getUserFromPayload = (payload: TokenPayload): User => {
  let membershipLevel = payload.data.membership.filter(m => !m.is_expired).reduce((prev, current) => {
    return (prev.level_id > current.level_id) ? prev : current;
  })?.level_slug;
  const possibleLevels = Object.values(MembershipLevel);
  if (!possibleLevels.includes(membershipLevel as MembershipLevel)) {
    membershipLevel = MembershipLevel.Free;
  }
  const user: User = {
    ...payload.data.user,
    name: formatName(payload.data.user.name),
    level: membershipLevel as MembershipLevel,
  };
  return user;
};

export const getUser = async (req: NextRequest): Promise<User | null> => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  // Mock user for development when auth is disabled
  if (!jwtSecretKey) {
    return { id: "1", name: "Test User", email: "test@test.com", level: MembershipLevel.Admin };
  }

  const secret = new TextEncoder().encode(jwtSecretKey);
  const accessToken = req.cookies.get('access_token')?.value;
  if (!accessToken) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<TokenPayload>(accessToken, secret);
    return getUserFromPayload(payload);
  } catch (error) {
    return null;
  }
}