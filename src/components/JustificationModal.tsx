import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Ban, Undo2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (justification: string) => void;
  contractId: string;
  actionType: 'return' | 'reject';
}

const JustificationModal: React.FC<JustificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contractId,
  actionType
}) => {
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!justification.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha a justificativa.",
        variant: "destructive"
      });
      return;
    }

    if (justification.trim().length < 10) {
      toast({
        title: "Atenção",
        description: "A justificativa deve ter pelo menos 10 caracteres.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(justification);
    setJustification('');
    onClose();
  };

  const handleClose = () => {
    setJustification('');
    onClose();
  };

  const title = actionType === 'return' ? 'Devolver Pagamento' : 'Rejeitar Pagamento';
  const icon = actionType === 'return' ? Undo2 : Ban;
  const iconColor = actionType === 'return' ? 'text-orange-600' : 'text-red-600';
  const buttonColor = actionType === 'return' 
    ? 'bg-orange-600 hover:bg-orange-700' 
    : 'bg-red-600 hover:bg-red-700';

  const Icon = icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription>
            Contrato: <span className="font-semibold">{contractId}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">
                  {actionType === 'return' 
                    ? 'O pagamento será devolvido ao responsável para revisão.'
                    : 'O pagamento será rejeitado e não será processado.'
                  }
                </p>
                <p className="text-amber-700">
                  Um e-mail será enviado automaticamente ao responsável pelo pagamento com sua justificativa.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification" className="text-base font-semibold">
              Justificativa *
            </Label>
            <Textarea
              id="justification"
              placeholder={
                actionType === 'return'
                  ? 'Descreva o motivo da devolução do pagamento (ex: documentação incompleta, valores divergentes, etc.)...'
                  : 'Descreva o motivo da rejeição do pagamento (ex: contrato não conforme, irregularidades identificadas, etc.)...'
              }
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[150px] resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Mínimo 10 caracteres</span>
              <span>{justification.length}/1000</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className={`${buttonColor} text-white`}
            disabled={justification.trim().length < 10}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JustificationModal;
