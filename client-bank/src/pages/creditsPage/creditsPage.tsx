import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ApplyCreditModal } from "../../features/credits/applyCreditModal";
import { CreditCard } from "../../entities/creditCard";
import { useTheme } from "../../shared/lib/provider/themeProvider";
import { useNavigate } from "react-router-dom";

import { loadCreditsUseCase, loadTariffsUseCase } from "../../features/credits/useCases/loadCreditsTariffs";
import { applyCreditUseCase } from "../../features/credits/useCases/applyCreditUseCase";

import { SpinnerComponent } from "../../shared/ui/components/spinner";
import { PaginationComponent } from "../../shared/ui/components/pagination";

import { fetchAllAccounts } from "../../shared/lib/api/accounts";
import type { Account } from "../../shared/lib/api/accounts";

import type { Credit, Tariff } from "../../shared/lib/api/credits";

export const CreditsPage = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [creditsPage, setCreditsPage] = useState({ page: 0, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(0);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const { theme } = useTheme();
  const navigate = useNavigate();
  const pageSize = 6;

  useEffect(() => {
    setLoadingCredits(true);
    loadCreditsUseCase(currentPage + 1, pageSize)
      .then((data) => {
        setCredits(data.content);
        setCreditsPage({ page: data.page.page, totalPages: data.page.totalPages });
      })
      .finally(() => setLoadingCredits(false));
  }, [currentPage]);

  useEffect(() => {
    if (!showApplyModal) return;
    setTariffsLoading(true);
    loadTariffsUseCase()
      .then((data) => setTariffs(data))
      .finally(() => setTariffsLoading(false));
  }, [showApplyModal]);

  useEffect(() => {
    setAccountsLoading(true);
    fetchAllAccounts()
      .then(setAccounts)
      .finally(() => setAccountsLoading(false));
  }, []);

  const handleApplyCredit = async (tariffId: string, accountId: string, amount: number, term: number) => {
    try {
      await applyCreditUseCase(tariffId, accountId, amount, term);
      setShowApplyModal(false);
      const data = await loadCreditsUseCase(currentPage + 1, pageSize);
      setCredits(data.content);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Неизвестная ошибка при оформлении кредита");
      }
    }
  };

  return (
    <Container className="py-5">
      <ApplyCreditModal
        show={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmit={handleApplyCredit}
        tariffs={tariffs}
        accounts={accounts} 
        loading={tariffsLoading || accountsLoading}
        error={null}
      />

      <Row className="mb-4">
        <Col><h2>Мои кредиты</h2></Col>
        <Col className="text-end">
          <div className="d-flex justify-content-end gap-2">
            <Button variant={theme === "DARK" ? "outline-light" : "info"} onClick={() => navigate("/credits/analytics")}>Рейтинг и просрочки</Button>
            <Button variant={theme === "DARK" ? "outline-light" : "success"} onClick={() => setShowApplyModal(true)}>Взять кредит</Button>
          </div>
        </Col>
      </Row>

      {loadingCredits ? (
        <SpinnerComponent theme={theme} />
      ) : credits.length === 0 ? (
        <Row className="mt-5">
          <Col className="text-center">
            <p>У вас пока нет кредитов.</p>
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            {credits.map((c) => (
              <Col md={6} key={c.id} className="mb-4 d-flex">
                <CreditCard credit={c} theme={theme} />
              </Col>
            ))}
          </Row>

          {credits.length > 0 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={creditsPage.totalPages}
                  onPageChange={setCurrentPage}
                  theme={theme}
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};