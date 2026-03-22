import { creditsService } from "../../../shared/lib/services/creditsService";

export const applyCreditUseCase = async (tariffId: string, accountId: string, amount: number, term: number) => {
  try {
    return await creditsService.applyCredit(tariffId, accountId, amount, term);
  } catch (err: any) {
    if (err.response?.status === 409) {
      throw new Error("На мастер счете недостаточно денег для выдачи кредита");
    }
    throw new Error("Ошибка при оформлении кредита");
  }
};