import { Store, Phone, MessageCircle } from "lucide-react";

interface CatalogHeaderProps {
  businessName: string;
  logoUrl: string | null;
  description: string | null;
  phoneWhatsapp: string | null;
  primaryColor?: string | null;
}

export function CatalogHeader({
  businessName,
  logoUrl,
  description,
  phoneWhatsapp,
  primaryColor,
}: CatalogHeaderProps) {
  const accentStyle = primaryColor
    ? ({ "--accent-color": primaryColor } as React.CSSProperties)
    : undefined;

  return (
    <header
      className="border-b bg-background"
      style={accentStyle}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={businessName}
              className="size-14 rounded-xl object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
              <Store className="size-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">{businessName}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {phoneWhatsapp && (
          <div className="flex items-center gap-3 sm:ml-auto">
            <a
              href={`tel:${phoneWhatsapp}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="size-4" />
              {phoneWhatsapp}
            </a>
            <a
              href={`https://wa.me/${phoneWhatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#1da851] transition-colors"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
