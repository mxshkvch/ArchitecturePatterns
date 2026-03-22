import { creditsService } from "../../../shared/lib/services/creditsService";

export const loadCreditsUseCase = async (page: number, size: number) => {
  try {
    const data = await creditsService.getMyCredits(page, size);
    return data;
  } catch (err) {
    console.error("Ошибка загрузки кредитов", err);
    return {
      content: [],
      page: { page: 0, size, totalElements: 0, totalPages: 0 },
    };
  }
};

export const loadTariffsUseCase = async () => {
  try {
    return await creditsService.getTariffs();
  } catch (err) {
    console.error("Ошибка загрузки тарифов", err);
    return [];
  }
};