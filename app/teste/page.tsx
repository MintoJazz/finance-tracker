"use client";

import { FieldErrors } from "react-hook-form";
import { BucketFormType } from "@/features/buckets/form/schema/bucket-schema";
import CreateBucket from "@/features/buckets/components/create-bucket-dialog";

export default function Page() {
  const onSubmit = (data: BucketFormType) => {
    console.log("✅ Dados válidos submetidos:", data);
    alert(JSON.stringify(data, null, 2));
  };

  const onError = (errors: FieldErrors<BucketFormType>) => {
    console.error("❌ Erro na validação:", errors);
  };

  return <CreateBucket isOpen onSubmit={onSubmit} onError={onError} />;
}