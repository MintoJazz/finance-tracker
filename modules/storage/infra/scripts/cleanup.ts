import "dotenv/config";
import { StorageFactory } from "@/modules/storage/infra/factories/storage.factory";

async function main() {
  console.log("Iniciando limpeza de uploads pendentes expirados...");
  const useCase = StorageFactory.makeCleanupStaleUploads();
  const result = await useCase.execute();

  if (result.success) {
    console.log(
      `Limpeza concluída com sucesso. Total removido: ${result.data.cleanedCount}`
    );
    if (result.data.deletedIds.length > 0) {
      console.log("IDs removidos:", result.data.deletedIds);
    }
  } else {
    console.error("Falha na limpeza de uploads:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Erro fatal ao executar script de limpeza:", err);
  process.exit(1);
});
