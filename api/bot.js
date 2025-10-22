import { Telegraf, Markup, Scenes, session } from "telegraf";
import axios from "axios";

// ✅ Берём токен и другие переменные из окружения
const BOT_TOKEN = process.env.BOT_TOKEN;
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const ADMIN_ID = process.env.ADMIN_ID;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN не найден. Добавь его в переменные окружения Vercel.");
}

const bot = new Telegraf(BOT_TOKEN);

// ======== СЦЕНЫ =========
const askName = new Scenes.BaseScene("askName");
askName.enter((ctx) => ctx.reply("👋 Как вас зовут?"));
askName.on("text", (ctx) => {
  ctx.scene.state.name = ctx.message.text;
  ctx.scene.enter("askService");
});

const askService = new Scenes.BaseScene("askService");
askService.enter((ctx) =>
  ctx.reply(
    "🎨 Какая услуга вас интересует?",
    Markup.keyboard([
      ["Айдентика", "Веб-дизайн"],
      ["Оформление для соцсетей", "Телеграм-боты"],
    ])
      .oneTime()
      .resize()
  )
);
askService.on("text", (ctx) => {
  ctx.scene.state.service = ctx.message.text;
  ctx.scene.enter("askContact");
});

const askContact = new Scenes.BaseScene("askContact");
askContact.enter((ctx) => ctx.reply("📞 Оставьте контакт (Telegram или e-mail):"));
askContact.on("text", async (ctx) => {
  const { name, service } = ctx.scene.state;
  const contact = ctx.message.text;

  try {
    if (GOOGLE_SCRIPT_URL) {
      await axios.post(GOOGLE_SCRIPT_URL, { name, service, contact });
    } else {
      console.warn("GOOGLE_SCRIPT_URL not set — skipping POST to Google Script.");
    }

    await ctx.reply(`✅ Спасибо, ${name}! Ваша заявка получена.`);

    const message = `📬 *Новая заявка!*\n👤 Имя: ${name}\n🎨 Услуга: ${service}\n📱 Контакт: ${contact}`;
    if (ADMIN_ID) {
      await bot.telegram.sendMessage(ADMIN_ID, message, { parse_mode: "Markdown" });
    } else {
      console.warn("ADMIN_ID not set — skipping admin notification.");
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("⚠️ Ошибка при отправке данных.");
  }

  ctx.scene.leave();
  showMenu(ctx);
});

function showMenu(ctx) {
  return ctx.reply("✨ Добро пожаловать в студию дизайна Lavereet!", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🎨 Услуги", "services")],
      [Markup.button.callback("📁 Портфолио", "portfolio")],
      [Markup.button.callback("📝 Оставить заявку", "order")],
      [Markup.button.callback("ℹ️ Контакты", "contacts")],
    ]),
  });
}

const stage = new Scenes.Stage([askName, askService, askContact]);
bot.use(session());
bot.use(stage.middleware());

// ======== КОМАНДЫ =========
bot.start((ctx) => showMenu(ctx));

bot.action("services", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "🎨 Мы создаём:\n• Айдентику\n• Веб-дизайн\n• Оформление соцсетей\n• Телеграм-ботов",
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback("📝 Оставить заявку", "order")],
        [Markup.button.callback("⬅️ Назад в меню", "menu")],
      ]),
    }
  );
});

bot.action("portfolio", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("📁 Наши работы скоро появятся здесь.", {
    ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "menu")]]),
  });
});

bot.action("contacts", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "📞 Контакты студии Lavereet:\nTelegram: @Lavereet\nEmail: lavereet.design@gmail.com",
    {
      ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "menu")]]),
    }
  );
});

bot.action("order", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📝 Отлично! Начнём оформление заявки.");
  await ctx.scene.enter("askName");
});

bot.action("menu", async (ctx) => {
  await ctx.answerCbQuery();
  showMenu(ctx);
});

// ======== ЭКСПОРТ ДЛЯ VERCEL =========
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send("ok");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
    }
  } else {
    res.status(200).send("Bot endpoint working ✅");
  }
}
