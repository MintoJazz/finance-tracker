import { ControllerProps } from "react-hook-form"
import { TransactionFormType } from "./schemas/types"
import { AmountField, DateField, DescriptionField } from "./form-fields"

type FieldDef = Omit<ControllerProps<TransactionFormType>, "control">

export const FIELD_REGISTRY = {
    amount:      { name: "amount",      render: (props) => <AmountField      {...props} /> },
    description: { name: "description", render: (props) => <DescriptionField {...props} /> },
    date:        { name: "date",        render: (props) => <DateField        {...props} /> },
} satisfies Record<string, FieldDef>

export type FieldKey = keyof typeof FIELD_REGISTRY