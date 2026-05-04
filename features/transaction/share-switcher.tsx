import { Button } from "@/components/ui/button";
import { Users2 } from "lucide-react";

export default function ShareSwitcher() {
    return <Button variant="ghost" size={"icon-sm"} className="h-fit w-fit p-1 rounded-md" >
        <Users2 size={12} />
    </Button>
}