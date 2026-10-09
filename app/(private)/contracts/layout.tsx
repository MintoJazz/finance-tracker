interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function ContractsLayout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
