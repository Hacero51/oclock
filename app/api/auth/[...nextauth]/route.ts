import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        console.log("🔥 [NEXTAUTH] authorize called! Username:", credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log("⚠️ [NEXTAUTH] Missing username or password");
          return null;
        }

        // 🛑 Rate Limit por Usuario (5 intentos en 1 minuto)
        const limit = checkRateLimit(`login_${credentials.username}`, 5, 60000, 900000);
        if (limit.isBlocked) {
          throw new Error("Demasiados intentos. Por seguridad, el acceso a este usuario se ha bloqueado temporalmente (15 min).");
        }

        // 🔐 Hash MD5 con uppercase
        const hashedPassword = crypto
          .createHash("md5")
          .update(credentials.password)
          .digest("hex")
          .toUpperCase();

        //console.log("🟡 Password MD5 generado:", hashedPassword);

        // Buscar usuario en BD
        const user = await prisma.euser.findFirst({
          where: { UserName: credentials.username },
        });

        //console.log("🟣 Resultado de búsqueda en BD:", user);

        if (!user) {
          console.log("❌ Usuario no encontrado");
          return null;
        }

        // Comparar hash
        if (user.StoredPassword !== hashedPassword) {
          //console.log("❌ Contraseña incorrecta");
          return null;
        }

        console.log("🟢 Login correcto:", {
          id: user.Oid,
          username: user.UserName,
        });

        return {
          id: user.Oid,
          username: user.UserName,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      console.log("🔥 [NEXTAUTH] jwt callback. User:", user ? "yes" : "no");
      if (user) {
        token.id = user.id;
        token.username = user.username;

        // 🛡️ Obtener roles del usuario desde la BD
        const userRoles = await prisma.euserusers_eroleroles.findMany({
          where: { Users: user.id }
        });

        const rolesOids = userRoles.map(ur => ur.Roles).filter(Boolean) as string[];
        const rolesData = await prisma.rolebase.findMany({
          where: { Oid: { in: rolesOids } },
          select: { Name: true }
        });

        token.roles = rolesData.map(r => r.Name?.trim());
      }
      return token;
    },

    async session({ session, token }: { session: any, token: any }) {
      console.log("🔥 [NEXTAUTH] session callback. Token Username:", token?.username);
      session.user = {
        id: token.id,
        username: token.username,
        roles: token.roles || [],
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



