import type PocketBase from "pocketbase";

// Открытые объявления заказчика ("Разместить заказ" в кабинете, 2026-08-29)
// — заказчик описывает задачу свободным текстом (категория/подкатегория
// опциональны), специалисты откликаются, каждый отклик становится обычным
// lead + чатом (см. lib/chat.ts) с пометкой job_post_id, откуда он взялся.
// Схема и правила — pocketbase/pb_migrations/1755000040_job_posts.js,
// протестированы локально на реальном PocketBase перед деплоем (создание
// объявления, два отклика разных специалистов, отказ одному, закрытие
// объявления целиком, попытка откликнуться на уже закрытое — 400).

export type JobPostStatus = "open" | "closed";

export interface JobPost {
  id: string;
  customerId: string;
  customerName: string;
  categorySlug: string;
  subcategory: string;
  description: string;
  status: JobPostStatus;
  createdAt: string;
}

export interface JobPostResponse {
  leadId: string;
  specialistProfileId: string;
  specialistName: string;
  message: string;
  status: string;
  createdAt: string;
}

function mapJobPost(r: Record<string, unknown>): JobPost {
  return {
    id: r.id as string,
    customerId: r.customer_id as string,
    customerName: r.customer_name as string,
    categorySlug: (r.category_slug as string) ?? "",
    subcategory: (r.subcategory as string) ?? "",
    description: r.description as string,
    status: r.status as JobPostStatus,
    createdAt: r.created as string,
  };
}

export async function createJobPost(
  pb: PocketBase,
  params: {
    customerId: string;
    customerName: string;
    categorySlug?: string;
    subcategory?: string;
    description: string;
  }
): Promise<JobPost> {
  const record = await pb.collection("job_posts").create({
    customer_id: params.customerId,
    customer_name: params.customerName,
    category_slug: params.categorySlug ?? "",
    subcategory: params.subcategory ?? "",
    description: params.description,
    status: "open",
  });
  return mapJobPost(record);
}

export async function fetchCustomerJobPosts(pb: PocketBase, customerId: string): Promise<JobPost[]> {
  const records = await pb.collection("job_posts").getFullList({
    filter: pb.filter("customer_id = {:id}", { id: customerId }),
    sort: "-created",
  });
  return records.map(mapJobPost);
}

export async function closeJobPost(pb: PocketBase, jobPostId: string): Promise<JobPost> {
  const record = await pb.collection("job_posts").update(jobPostId, { status: "closed" });
  return mapJobPost(record);
}

// Открытые объявления для доски специалиста. Собственные объявления
// заказчика туда не попадают сами по себе — фильтруем по open, доска
// одна на все категории (специалист сам решает, что ему интересно).
export async function fetchOpenJobPosts(pb: PocketBase): Promise<JobPost[]> {
  const records = await pb.collection("job_posts").getFullList({
    filter: 'status = "open"',
    sort: "-created",
  });
  return records.map(mapJobPost);
}

// Счётчики откликов по всем объявлениям заказчика одним запросом — для
// карточек в списке ("3 отклика, 1 активный"), без похода в БД на каждую
// карточку отдельно.
export async function fetchJobPostResponseCounts(
  pb: PocketBase,
  customerId: string
): Promise<Record<string, { total: number; active: number }>> {
  const records = await pb.collection("leads").getFullList({
    filter: pb.filter('customer_id = {:id} && job_post_id != ""', { id: customerId }),
    fields: "job_post_id,status",
  });
  const counts: Record<string, { total: number; active: number }> = {};
  for (const r of records) {
    const key = r.job_post_id as string;
    if (!key) continue;
    if (!counts[key]) counts[key] = { total: 0, active: 0 };
    counts[key].total += 1;
    if (r.status !== "closed") counts[key].active += 1;
  }
  return counts;
}

// Новые отклики на объявление должны появляться у заказчика сразу, без
// перезагрузки страницы — по просьбе пользователя, тот же принцип, что и у
// realtime-подписок на сообщения/сделку в LeadChat (lib/chat.ts). Отдаём
// только сам факт нового отклика (id заявки) — вызывающая сторона просто
// перечитывает список откликов целиком, так проще получить имя специалиста
// (expand) без риска разойтись с обычным fetchJobPostResponses.
export async function subscribeToJobPostResponses(
  pb: PocketBase,
  jobPostId: string,
  onCreate: (leadId: string) => void
): Promise<() => void> {
  return pb.collection("leads").subscribe("*", (e) => {
    if (e.action === "create" && e.record.job_post_id === jobPostId) {
      onCreate(e.record.id);
    }
  });
}

// Отклики (=leads с job_post_id) на конкретное объявление — для заказчика,
// чтобы показать список параллельных чатов внутри карточки объявления.
export async function fetchJobPostResponses(pb: PocketBase, jobPostId: string): Promise<JobPostResponse[]> {
  const records = await pb.collection("leads").getFullList({
    filter: pb.filter("job_post_id = {:id}", { id: jobPostId }),
    expand: "specialist_profile_id",
    sort: "-created",
  });
  return records.map((r) => ({
    leadId: r.id,
    specialistProfileId: r.specialist_profile_id,
    specialistName: r.expand?.specialist_profile_id?.public_name ?? "Специалист",
    message: r.request_text,
    status: r.status,
    createdAt: r.created,
  }));
}

export interface DeclinedResponse {
  leadId: string;
  jobPostId: string;
  jobPostDescription: string;
  specialistProfileId: string;
  specialistName: string;
  message: string;
  declinedAt: string;
}

// Все отказанные отклики заказчика сразу по всем объявлениям — по просьбе
// пользователя: карточка отклика (и вся переписка внутри неё, ничего не
// удаляется при "Отказать") должна оставаться доступной в архиве, чтобы
// можно было вспомнить, почему отказали. expand достаёт и имя специалиста,
// и текст самого объявления (для контекста — "отказано по какой задаче").
export async function fetchDeclinedResponses(pb: PocketBase, customerId: string): Promise<DeclinedResponse[]> {
  const records = await pb.collection("leads").getFullList({
    filter: pb.filter('customer_id = {:id} && job_post_id != "" && status = "closed"', { id: customerId }),
    expand: "specialist_profile_id,job_post_id",
    sort: "-updated",
  });
  return records.map((r) => ({
    leadId: r.id,
    jobPostId: r.job_post_id,
    jobPostDescription: r.expand?.job_post_id?.description ?? "",
    specialistProfileId: r.specialist_profile_id,
    specialistName: r.expand?.specialist_profile_id?.public_name ?? "Специалист",
    message: r.request_text,
    declinedAt: r.updated,
  }));
}

// specialist_profile_id этого специалиста среди откликов на переданные
// объявления — чтобы на доске показать "Открыть чат" вместо формы отклика
// там, где он уже откликнулся.
export async function fetchOwnJobPostResponses(
  pb: PocketBase,
  specialistProfileId: string
): Promise<Array<{ jobPostId: string; leadId: string }>> {
  const records = await pb.collection("leads").getFullList({
    filter: pb.filter("specialist_profile_id = {:id} && job_post_id != \"\"", { id: specialistProfileId }),
    fields: "id,job_post_id",
  });
  return records.map((r) => ({ jobPostId: r.job_post_id, leadId: r.id }));
}

export async function respondToJobPost(
  pb: PocketBase,
  params: {
    jobPost: JobPost;
    specialistProfileId: string;
    message: string;
  }
): Promise<string> {
  const record = await pb.collection("leads").create({
    specialist_profile_id: params.specialistProfileId,
    customer_id: params.jobPost.customerId,
    customer_name: params.jobPost.customerName,
    request_text: params.message,
    category_slug: params.jobPost.categorySlug,
    job_post_id: params.jobPost.id,
    status: "new",
    source: "job_post",
  });
  return record.id;
}

// "Отказать" отклику — чат не удаляется, просто гаснет в списке (lead.status
// = "closed", тот же статус, что уже используется для обычных заявок).
export async function declineJobPostResponse(pb: PocketBase, leadId: string): Promise<void> {
  await pb.collection("leads").update(leadId, { status: "closed" });
}
