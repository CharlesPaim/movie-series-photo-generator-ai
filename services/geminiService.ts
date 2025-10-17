import { GoogleGenAI, Modality } from "@google/genai";

export const generateMovieThemedPhoto = async (
  base64ImageData: string,
  mimeType: string,
  theme: string,
  aspectRatio: string,
): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("A chave de API do Gemini não foi encontrada. Por favor, configure o 'Secret' API_KEY para usar o aplicativo.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const prompt = `Crie uma **nova imagem** com base na(s) pessoa(s) da foto fornecida, transformando-a(s) em personagem(ns) do universo "${theme}". A imagem deve ser uma **CENA CINEMATOGRÁFICA FOTORREALISTA** ou um **PÔSTER DE FILME**.

**Instrução Crítica de Formato:** A imagem final DEVE ser completamente renderizada com uma proporção de **${aspectRatio}**. Se a imagem original tiver uma proporção diferente, expanda e recrie o cenário, o fundo e os elementos ao redor para preencher perfeitamente o novo formato, mantendo a estética de "${theme}". Não estique ou distorça a imagem original; em vez disso, gere conteúdo adicional para o ambiente.

**Estilo e Qualidade:**
- **Estética:** Corresponda **EXATAMENTE** à paleta de cores, iluminação (dramática, volumétrica), figurinos e adereços do filme/série "${theme}".
- **Qualidade Técnica:** Renderize em **8K, hiper-detalhado**, como se fosse capturado com uma **lente prime de 85mm com profundidade de campo rasa (bokeh)**.

**Preservação de Identidade:**
- Mantenha os traços faciais e a semelhança da(s) pessoa(s) **INTACTOS**. Elas devem ser perfeitamente reconhecíveis.

Se houver várias pessoas, transforme cada uma em um personagem apropriado.

Retorne **apenas** a imagem final, sem texto ou bordas adicionais.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Verifique primeiro se a solicitação foi bloqueada por motivos de segurança.
    if (response.promptFeedback?.blockReason) {
      throw new Error(`A solicitação foi bloqueada por motivos de segurança: ${response.promptFeedback.blockReason}`);
    }

    if (
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      // Primeiro, tente encontrar a parte da imagem.
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      
      // Se nenhuma imagem for encontrada, verifique se há uma parte de texto (que pode ser um erro/explicação).
      let textResponse = "";
      for (const part of response.candidates[0].content.parts) {
          if (part.text) {
              textResponse += part.text;
          }
      }
      if(textResponse) {
          throw new Error(`A IA retornou uma mensagem: ${textResponse}`);
      }
    }
    
    throw new Error("Nenhuma imagem foi gerada. A resposta da IA estava vazia ou malformada.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar imagem: ${error.message}`);
    }
    throw new Error("Falha ao gerar imagem. Verifique o console para mais detalhes.");
  }
};

export const generateVideoPrompt = async (
  base64ImageData: string,
  mimeType: string,
  theme: string,
): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("A chave de API do Gemini não foi encontrada.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const prompt = `Você é um diretor de criação de um estúdio de cinema. Com base na imagem fornecida, que é uma cena com o tema "${theme}", gere um prompt **HIPER-DETALHADO** para um modelo de IA de texto para vídeo, como o Google Veo. O prompt deve descrever uma **micro-cena cinematográfica em movimento** que dê vida a esta imagem estática.

Instruções:
- **Ação Sutil:** Descreva uma ação ou movimento sutil do personagem (ex: piscar de olhos, mudança de expressão lenta, movimento de um objeto de cena) que transforme a pose estática em um clipe.
- **Estilo Visual:** O clipe deve ter **Cor Cinematográfica (Cinematic Color Grading)**, **Iluminação Dramática e Volumétrica**, correspondendo exatamente à estética de "${theme}".
- **Câmera:** Especifique um movimento de câmera suave e deliberado (ex: dolly in lento, travelling lateral, ou zoom suave).
- **Som/Atmosfera:** Mencione um efeito sonoro ou trilha sonora de fundo que reforce o tom da cena (ex: "Trilha sonora épica crescendo", "Vento uivante").
- **Formato:** A saída deve ser um único parágrafo de texto, pronto para ser copiado. Não inclua títulos, numeração ou formatação extra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error(`A solicitação foi bloqueada por motivos de segurança: ${response.promptFeedback.blockReason}`);
    }
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API for video prompt:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar roteiro para vídeo: ${error.message}`);
    }
    throw new Error("Falha ao gerar roteiro para vídeo. Verifique o console para mais detalhes.");
  }
};