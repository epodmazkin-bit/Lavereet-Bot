import { Telegraf, Markup, Scenes, session } from "telegraf";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BOT_TOKEN = process.env8413997708AAG9DMF6DZJidNozMfH8oHZyilTShlS3EU;
const GOOGLE_SCRIPT_URL = process.env.https//script.google.com/macros/s/AKfycbxiFlm2r7y3nOogjlQQ9kNn2BsoPj5KuW0E5bq7mdEiDzIGcTJdcEe5UNVHzgZ5Edvjjw/exec;
const ADMIN_ID = process.env1702469455;

if (!BOT_TOKEN) throw new Error("❌ BOT_TOKEN not provided in environment");

const bot = new Telegraf8413997708AAG9DMF6DZJidNozMfH8oHZyilTShlS3EU;

// --- Сцены ---
const askName = new Scenes.BaseScene("askName");
askName.enter((ctx) => ctx.reply("👋 Как вас зовут?"));
askName.on("text", (ctx) => {
  ctx.scene.state.name = ctx.message.text;
  ctx.scene.enter("askService");
});

// 👉 теперь askService не используется для выбора услуги, только переход в новую сцену
const askService = new Scenes.BaseScene("askService");
askService.enter((ctx) =>
  ctx.reply("🎨 Выберите категорию услуги:", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🎨 Графика", "graphics")],
      [Markup.button.callback("💻 Веб-разработка", "webdev")],
      [Markup.button.callback("⬅️ Назад в меню", "menu")],
    ]),
  })
);

// Сцена для контакта
const askContact = new Scenes.BaseScene("askContact");
askContact.enter((ctx) => ctx.reply("📞 Оставьте контакт (Telegram или номер телефона):"));
askContact.on("text", async (ctx) => {
  const { name, service } = ctx.scene.state;
  const contact = ctx.message.text;

  try {
    await axios.post("https//script.google.com/macros/s/AKfycbxiFlm2r7y3nOogjlQQ9kNn2BsoPj5KuW0E5bq7mdEiDzIGcTJdcEe5UNVHzgZ5Edvjjw/exec", { name, service, contact });
    await ctx.reply(`✅ Спасибо, ${name}! Ваша заявка получена.`);

    const message = `
📬 *Новая заявка!*
👤 Имя: ${name}
🎨 Услуга: ${service}
📱 Контакт: ${contact}
`;
    await bot.telegram.sendMessage(1702469455, message, { parse_mode: "Markdown" });

  } catch (err) {
    console.error(err);
    await ctx.reply("⚠️ Ошибка при отправке данных.");
  }

  ctx.scene.leave();
  showMenu(ctx);
});

// --- Главное меню ---
function showMenu(ctx) {
  return ctx.editMessageText
    ? ctx.editMessageText("✨ Добро пожаловать в студию дизайна *Lavereet*! Мы создаём стильный и осмысленный дизайн — без шаблонов и суеты, только честный визуал.", {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🎨 Услуги", "services")],
          [Markup.button.callback("📁 Портфолио", "portfolio")],
          [Markup.button.callback("📝 Оставить заявку", "order")],
          [Markup.button.callback("ℹ️ Контакты", "contacts")],
        ]),
      })
    : ctx.reply("✨ Добро пожаловать в студию дизайна *Lavereet*! Мы создаём стильный и осмысленный дизайн — без шаблонов и суеты, только честный визуал.", {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🎨 Услуги", "services")],
          [Markup.button.callback("📁 Портфолио", "portfolio")],
          [Markup.button.callback("📝 Оставить заявку", "order")],
          [Markup.button.callback("ℹ️ Контакты", "contacts")],
        ]),
      });
}

// --- Настройка сцен ---
const stage = new Scenes.Stage([askName, askService, askContact]);
bot.use(session());
bot.use(stage.middleware());

// --- Команды и действия ---
bot.start((ctx) => showMenu(ctx));

/* ==============================
   1. Раздел Услуги
   ============================== */
bot.action("services", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("🎨 Выберите категорию услуги:", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🎨 Графика", "graphics")],
      [Markup.button.callback("💻 Веб-разработка", "webdev")],
      [Markup.button.callback("⬅️ Назад в меню", "menu")],
    ]),
  });
});

/* ==============================
   2. Подраздел — Графика
   ============================== */
bot.action("graphics", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("🖌 Выберите услугу из категории *Графика*:", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Логотип", "service_Логотип")],
      [Markup.button.callback("Фирменный стиль", "service_Фирменный стиль")],
      [Markup.button.callback("Оформление соц сетей", "service_Оформление соц сетей")],
      [Markup.button.callback("Инфографика", "service_Инфографика")],
      [Markup.button.callback("⬅️ Назад", "services")],
    ]),
  });
});

/* ==============================
   3. Подраздел — Веб-разработка
   ============================== */
bot.action("webdev", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("💻 Выберите услугу из категории *Веб-разработка*:", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Лендинги", "service_Лендинги")],
      [Markup.button.callback("Сайты", "service_Сайты")],
      [Markup.button.callback("Телеграм-боты", "service_Телеграм-боты")],
      [Markup.button.callback("⬅️ Назад", "services")],
    ]),
  });
});

/* ==============================
   4. Выбор конкретной услуги
   ============================== */
bot.action(/^service_(.+)/, async (ctx) => {
  const serviceName = ctx.match[1];
  ctx.scene.state.service = serviceName;
  await ctx.answerCbQuery();
  await ctx.editMessageText(`📝 Вы выбрали услугу: *${serviceName}*`, {
    parse_mode: "Markdown",
  });
  await ctx.reply("📞 Теперь оставьте контакт (Telegram или номер телефона):");
  await ctx.scene.enter("askContact");
});

/* ==============================
   Остальные действия
   ============================== */
bot.action("portfolio", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("📁 Наши работы скоро появятся здесь.", {
    ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "menu")]]),
  });
});

bot.action("contacts", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
    "📞 Контакты студии Lavereet:\nTelegram: @lavereet_agency\nEmail: lavereet.agency@gmail.com",
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
  await showMenu(ctx);
});

// --- Для серверных сред (Vercel и т.п.) ---
export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
}