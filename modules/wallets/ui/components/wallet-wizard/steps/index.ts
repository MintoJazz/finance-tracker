import type { WizardStep } from "@/components/wizard";
import type { CreateWalletFormValues } from "@/modules/wallets/models/wallet.schema";
import { walletBasicsStep } from "./basics.step";
import { walletReviewStep } from "./review.step";

export { walletBasicsStep } from "./basics.step";
export { walletReviewStep, WalletReviewContent } from "./review.step";

export const walletWizardSteps: WizardStep<CreateWalletFormValues>[] = [
  walletBasicsStep,
  walletReviewStep,
];
