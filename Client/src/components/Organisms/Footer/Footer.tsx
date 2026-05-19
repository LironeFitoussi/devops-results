import { Text } from "@/components/Atoms/Text";
import { cn } from "@/lib/utils";

export interface FooterProps {
  appName?: string;
  currentYear?: number;
  links?: Array<{ label: string; href: string }>;
  className?: string;
}

const defaultLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer({ 
  appName = "YourApp", 
  currentYear = new Date().getFullYear(),
  links = defaultLinks,
  className 
}: FooterProps) {
  return (
    <footer className={cn("border-t border-gray-200 bg-white py-4 px-6", className)}>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <Text variant="small" color="muted">
          © {currentYear} {appName}. All rights reserved.
        </Text>
        <div className="flex space-x-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

