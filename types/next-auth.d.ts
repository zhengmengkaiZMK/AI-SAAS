import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    membershipType: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      membershipType: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    membershipType: string;
  }
}
