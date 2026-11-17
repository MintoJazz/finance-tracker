interface Props {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function RecurrencesLayout({ children, modal }: Props) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}
