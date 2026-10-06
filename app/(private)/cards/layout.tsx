interface Props {
    children: React.ReactNode;
    modal: React.ReactNode;
}

export default function CardsLayout({ children, modal }: Props) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}