import { prisma } from "../src/lib/db";
import { answerBuddyQuestion } from "../src/lib/buddy-service";

async function testUser(email: string, questions: string[]) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`User not found: ${email}`);

  console.log(`\n=== ${email} ===`);
  for (const q of questions) {
    const result = await answerBuddyQuestion(user.id, q, "en");
    console.log(`Q: ${q}`);
    console.log(`Intent: ${result.intent}`);
    console.log(`A: ${result.reply.slice(0, 120)}...`);
  }
}

async function main() {
  await testUser("rahul@email.com", [
    "My plan",
    "Referral code",
    "When can I withdraw?",
  ]);
  await testUser("priya@email.com", ["KYC status", "Can I withdraw now?"]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
