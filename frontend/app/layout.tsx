import "./globals.css";

export const metadata = {
  title: "ROMA Contract Explainer",
  description: "AI-powered smart contract analysis tool. Get human-friendly explanations of any EVM smart contract with ROMA framework.",
  icons: {
    icon: '/robot.svg',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/robot.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}
