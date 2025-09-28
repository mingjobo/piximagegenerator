import "next-auth";

declare module "next-auth" {
  interface JWT {
    user?: {
      uuid?: string;
      nickname?: string;
      avatar_url?: string;
      created_at?: string;
      // 兼容字段
      id?: string;
      name?: string;
      image?: string;
    };
  }

  interface Session {
    user: {
      uuid?: string;
      nickname?: string;
      avatar_url?: string;
      created_at?: string;
      // 兼容字段
      id?: string;
      name?: string;
      image?: string;
    } & DefaultSession["user"];
  }
}
