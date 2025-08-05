import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserFromPayload, MembershipLevel, TokenPayload, User } from './lib/getUser';

interface AuthResult {
  nextResponse?: NextResponse,
  user?: User
}

const failedAuthResponse = NextResponse.redirect('https://spitfirepremier.com/member-login?redirect_to=https://dashboard.spitfirepremier.com/', { status: 302 });

const refreshAccessToken = async (refreshToken: string) => {
  const refreshResponse = await fetch('https://spitfirepremier.com/wp-json/jwt-auth/v1/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!refreshResponse.ok) {
    throw new Error('Refresh token failed');
  }
  const data = await refreshResponse.json();
  const newAccessToken = data.access_token;
  if (!newAccessToken || typeof newAccessToken !== 'string' || !newAccessToken.length) {
    throw new Error('Access token missing after refresh');
  }
  return newAccessToken;
}

const authenticateRequest = async (req: NextRequest, jwtSecretKey: string): Promise<AuthResult> => {
  const secret = new TextEncoder().encode(jwtSecretKey);
  const accessToken = req.cookies.get('access_token')?.value;

  try {
    if (!accessToken) {
      throw new Error('Access token missing');
    }

    const { payload } = await jwtVerify<TokenPayload>(accessToken, secret);
    const user = getUserFromPayload(payload);
    return {
      user,
      nextResponse: NextResponse.next(),
    }
  } catch (err) {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return {
        nextResponse: failedAuthResponse,
      }
    }

    let newAccessToken: string;
    let user: User;
    try {
      const { payload } = await jwtVerify<TokenPayload>(refreshToken, secret);
      newAccessToken = await refreshAccessToken(refreshToken);
      user = getUserFromPayload(payload);
    } catch (refreshErr) {
      return {
        nextResponse: failedAuthResponse,
      }
    }

    const response = NextResponse.next();
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      path: '/',
      domain: '.spitfirepremier.com',
    });

    return {
      user,
      nextResponse: response,
    }
  }
}

const roleConfig: Record<string, MembershipLevel[]> = {
  '/api/admin': [
    MembershipLevel.Admin
  ],
  '/api/user': [
    MembershipLevel.Free,
    MembershipLevel.Level1,
    MembershipLevel.Level2,
    MembershipLevel.Level3,
    MembershipLevel.Admin
  ],
  '/api/resume': [
    MembershipLevel.Level1,
    MembershipLevel.Level3,
    MembershipLevel.Admin
  ],
  '/api/scorecard': [
    MembershipLevel.Level2,
    MembershipLevel.Level3,
    MembershipLevel.Admin
  ],
}

export async function middleware(req: NextRequest) {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;
  
  // Skip authentication if no JWT secret key is provided
  if (!jwtSecretKey) {
    return NextResponse.next();
  }

  const { user, nextResponse } = await authenticateRequest(req, jwtSecretKey);

  if (!user) {
    console.log('User not authenticated');
    return nextResponse;
  }

  const targetPath = req.nextUrl.pathname;
  const paths = Object.keys(roleConfig);

  for (const index in paths) {
    const path = paths[index];
    if (targetPath.startsWith(path)) {
      const allowedRoles = roleConfig[path];
      if (!allowedRoles.includes(user.level)) {
        console.log(`User ${user?.email} with role ${user?.level} not allowed to access ${path} (${targetPath})`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
  }

  return nextResponse;
}

export const config = {
  matcher: '/:path*',
};
