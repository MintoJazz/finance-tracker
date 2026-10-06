interface Props {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function WalletProfileLayout({
    children,
    modal,
}: Props) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}