interface Props {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function InstallmentsLayout({ children, modal }: Props) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}
