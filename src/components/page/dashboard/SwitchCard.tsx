import DurationToggle from "@/components/common/toggle/DurationToggle";
import Toggle from "@/components/common/toggle/Toggle";
import { Card } from "@/components/ui/card";

export default function SwitchCard() {
  return (
    <Card className="w-full border p-6">
      <div className="flex h-full flex-col items-center justify-center gap-8">
        <Toggle />
        <DurationToggle />
      </div>
    </Card>
  );
}
