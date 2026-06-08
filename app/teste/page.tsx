"use client";

import { FieldErrors } from "react-hook-form";
import { BucketFormType } from "@/features/buckets/form/schema/bucket-schema";
import CreateBucket from "@/features/buckets/components/create-bucket-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [open, setOpen] = useState<boolean>(false)
  const onSubmit = (data: BucketFormType) => {
    console.log("✅ Dados válidos submetidos:", data);
    alert(JSON.stringify(data, null, 2));
  };

  const onError = (errors: FieldErrors<BucketFormType>) => {
    console.error("❌ Erro na validação:", errors);
  };

  return <div>
    <Button onClick={() => setOpen(true)}>Teste</Button>
    <CreateBucket isOpen={open} onClose={setOpen} onSubmit={onSubmit} onError={onError} />
  </div>
}