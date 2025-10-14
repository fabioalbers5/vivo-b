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
    <Card className="p-2 w-56 min-h-[100px] max-h-[130px] flex flex-col flex-shrink-0">
      {canDelete && onDelete && (
        <div className="flex items-center justify-end mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </Card>
  );
};
export default FilterContainer;
