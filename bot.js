import { Telegraf, Markup } from "telegraf";

export function startBot(BOT_TOKEN, CHANNEL_USERNAME) {
  const bot = new Telegraf(BOT_TOKEN);

  bot.start(async (ctx) => {
    try {
      const user = ctx.from;
      const name = user.username
        ? `@${user.username}`
        : `${user.first_name || ""} ${user.last_name || ""}`.trim();

      // Kanalga obuna bo'lishni tekshirish
      let isSubscribed = false;
      try {
        const member = await ctx.telegram.getChatMember(
          CHANNEL_USERNAME,
          user.id
        );
        isSubscribed =
          member.status === "member" ||
          member.status === "creator" ||
          member.status === "administrator";
      } catch (err) {
        // Agar foydalanuvchi kanalni topa olmasa yoki boshqa xatolik
        isSubscribed = false;
      }

      // Xabar matni
      let message = `Salom, ${name}! 👋\n\n`;
      message += "Sizga ProCourse haqida ma'lumot beramiz.\n\n";

      if (!isSubscribed) {
        message += `Iltimos, bizning kanalimizga obuna bo'ling: ${CHANNEL_USERNAME}\n`;
        message +=
          "Obuna bo'lgandan so'ng, testlarni ishlash uchun Web App ga kirishingiz mumkin.";
      } else {
        message += "Siz kanalga obuna bo'lgansiz ✅\n";
        message += "Testlarni ishlash uchun Web App tugmasini bosing 👇";
      }

      // Inline button
      const buttons = isSubscribed
        ? Markup.inlineKeyboard([
            Markup.button.url("Open Web App", "https://t.me/MultilevelPro_Course")
          ])
        : Markup.inlineKeyboard([
            Markup.button.url("Bizning kanal", "https://t.me/MultilevelPro_Course")
          ]);

      await ctx.reply(message, buttons);
    } catch (err) {
      console.error("Error in /start:", err);
      await ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring."
      );
    }
  });

  bot.launch();
  console.log("✅ Bot started");
}
