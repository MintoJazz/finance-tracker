interface Props {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function ContractCycleLayout({ children, modal }: Props) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}
