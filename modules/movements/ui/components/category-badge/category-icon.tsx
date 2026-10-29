import React from "react";
import * as LucideIcons from "lucide-react";
import { LucideProps, Tag } from "lucide-react";

interface CategoryIconProps extends Omit<LucideProps, "name"> {
    name?: string | null;
}

function toPascalCase(str: string): string {
    return str
        .replace(/[-_ ]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
        .replace(/^(.)/, (c) => c.toUpperCase());
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
    if (!name || typeof name !== "string") {
        return <Tag {...props} />;
    }

    const pascalName = toPascalCase(name.trim());
    const iconsRecord = LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>;
    const IconComponent = iconsRecord[pascalName] ?? iconsRecord[name];

    if (IconComponent) {
        return <IconComponent {...props} />;
    }

    return <Tag {...props} />;
}
