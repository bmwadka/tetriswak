from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackContext

TOKEN = "7566789045:AAGGcOBNFtFuyLfa6ndvO0lmlZ5hwzTi5GM"
WEB_APP_URL = "https://github.com/bmwadka/tetriswak"

def start(update: Update, context: CallbackContext):
    button = InlineKeyboardButton(
        "🌐 Открыть Web App",
        web_app={"url": WEB_APP_URL}
    )
    update.message.reply_text(
        "Нажмите кнопку, чтобы открыть сайт 👇",
        reply_markup=InlineKeyboardMarkup([[button]])
    )

updater = Updater(TOKEN)
updater.dispatcher.add_handler(CommandHandler("start", start))
updater.start_polling()
updater.idle()
