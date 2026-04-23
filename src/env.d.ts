/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: { id: string; email: string; name: string } | null;
    session: { id: string; userId: string } | null;
  }
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly BETTER_AUTH_SECRET: string;
  readonly BETTER_AUTH_URL: string;
  readonly PUBLIC_APP_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
