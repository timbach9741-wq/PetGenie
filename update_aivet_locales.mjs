import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const updates = {
  ko: {
    ai_vet: {
      title: "24시간 AI 수의사 상담",
      welcome_msg: "안녕하세요! 반려동물의 건강 관리를 돕는 15년 경력의 AI 수의사입니다. 우리 아이의 건강에 대해 궁금한 점이나 이상 증상이 있다면 무엇이든 편하게 편안하게 물어보세요.",
      input_placeholder: "메시지를 입력해 주세요 (예: 사과를 먹어도 되나요?)",
      send: "전송",
      thinking: "AI 수의사가 답변을 작성하고 있습니다...",
      error: "답변을 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요."
    },
    benefit4: {
      title: "24/7 AI 수의사",
      free: "이용 불가",
      premium: "무제한 상담"
    }
  },
  en: {
    ai_vet: {
      title: "24/7 AI Vet Chat",
      welcome_msg: "Hello! I am an AI Veterinarian with 15 years of experience. Please feel free to ask any questions about your pet's health or symptoms.",
      input_placeholder: "Type your message (e.g. Can my dog eat apples?)",
      send: "Send",
      thinking: "AI Vet is typing...",
      error: "An error occurred while fetching the response. Please try again."
    },
    benefit4: {
      title: "24/7 AI Vet",
      free: "Not available",
      premium: "Unlimited chat"
    }
  },
  ja: {
    ai_vet: {
      title: "24時間対応 AI 獣医師相談",
      welcome_msg: "こんにちは！15年の経験を持つAI獣医師です。ペットの健康や気になる症状について、何でもお気軽にご相談ください。",
      input_placeholder: "メッセージを入力してください（例：りんごを食べても大丈夫ですか？）",
      send: "送信",
      thinking: "AI獣医師が入力中です...",
      error: "応答の取得中にエラーが発生しました。もう一度お試しください。"
    },
    benefit4: {
      title: "24時間 AI獣医師",
      free: "利用不可",
      premium: "無制限の相談"
    }
  },
  es: {
    ai_vet: {
      title: "Consulta Veterinaria IA 24/7",
      welcome_msg: "¡Hola! Soy un veterinario de IA con 15 años de experiencia. No dude en preguntar sobre la salud o los síntomas de su mascota.",
      input_placeholder: "Escriba su mensaje (ej. ¿Puede mi perro comer manzanas?)",
      send: "Enviar",
      thinking: "El veterinario IA está escribiendo...",
      error: "Ocurrió un error al obtener la respuesta. Por favor intente de nuevo."
    },
    benefit4: {
      title: "Veterinario IA 24/7",
      free: "No disponible",
      premium: "Chat ilimitado"
    }
  },
  zh: {
    ai_vet: {
      title: "24/7 AI 兽医咨询",
      welcome_msg: "您好！我是拥有15年经验的AI兽医。关于您宠物的健康或症状，请随时提问。",
      input_placeholder: "请输入您的消息（例如：我的狗能吃苹果吗？）",
      send: "发送",
      thinking: "AI兽医正在输入...",
      error: "获取响应时出错。请重试。"
    },
    benefit4: {
      title: "AI 兽医 24/7",
      free: "不可用",
      premium: "无限咨询"
    }
  }
};

for (const file of files) {
  const lang = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Add ai_vet object
    if (updates[lang]) {
      data.ai_vet = updates[lang].ai_vet;
      
      // Update membership keys
      if (data.membership) {
        data.membership.benefit4 = updates[lang].benefit4.title;
        data.membership.benefit4_free = updates[lang].benefit4.free;
        data.membership.benefit4_premium = updates[lang].benefit4.premium;
      }
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`Updated ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
