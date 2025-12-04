import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        //console.log("🔵 Recibiendo login:", credentials);

        if (!credentials?.username || !credentials?.password) {
          //console.log("❌ Faltan credenciales");
          return null;
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      //console.log("🔶 JWT token:", token);
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
      };
      //console.log("🟩 Sesión generada:", session);
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



