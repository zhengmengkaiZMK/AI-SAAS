"use client";

import { usePathname } from "next/navigation";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "./button";

interface GoogleSignInButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function GoogleSignInButton({ onClick, disabled = false }: GoogleSignInButtonProps) {
  const pathname = usePathname();
  const isZh = pathname.startsWith("/zh");

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    } else if (!disabled) {
      // 默认的 OAuth 流程
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`;
      
      if (clientId) {
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&access_type=offline`;
        window.location.href = googleAuthUrl;
      } else {
        console.log("Google OAuth flow triggered - Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      }
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      disabled={disabled}
      className="w-full py-1.5"
    >
      <IconBrandGoogle className="h-5 w-5" />
      <span className="text-sm font-semibold leading-6">
        {isZh ? "Google" : "Google"}
      </span>
    </Button>
  );
}
