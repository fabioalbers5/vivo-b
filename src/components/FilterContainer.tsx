import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
interface FilterContainerProps {
  title: string;
  children: ReactNode;
  canDelete?: boolean;
  onDelete?: () => void;
}
const FilterContainer = ({
  title,
  children,
  canDelete = false,
  onDelete
}: FilterContainerProps) => {
  return (
    <Card className="p-4 h-full min-h-[200px] flex flex-col">
      {canDelete && onDelete && (
        <div className="flex items-center justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </Card>
  );
};
export default FilterContainer;
