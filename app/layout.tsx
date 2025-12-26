import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./styles.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "rgb(30 41 59)",
              border: "1px solid rgb(100 116 139)",
              color: "rgb(226 232 240)",
            },
          }}
        />
      </body>
    </html>
  );
}
