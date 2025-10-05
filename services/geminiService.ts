
import { GoogleGenAI, Modality } from "@google/genai";

export const generateMovieThemedPhoto = async (
  base64ImageData: string,
  mimeType: string,
  theme: string,
): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error("A chave de API do Gemini não foi encontrada. Por favor, configure o 'Secret' API_KEY para usar o aplicativo.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const prompt = `Transforme a(s) pessoa(s) na foto para que se pareçam com personagem(ns) do filme ou série "${theme}". A imagem deve ser estilizada como um **PÔSTER DE FILME FOTORREALISTA** ou uma **CENA CINEMATOGRÁFICA**. Inclua figurinos, penteados, plano de fundo, adereços e iluminação que correspondam **EXATAMENTE** à estética e à paleta de cores do filme "${theme}".

**Melhoria de Qualidade:** A imagem deve ser renderizada em **fotografia de cinema, 8K, hiper-detalhada, com iluminação dramática e volumétrica**, capturada com uma **lente prime de 85mm com profundidade de campo rasa (bokeh)**.

**Instrução Crítica (Preservação):** Os traços faciais e a semelhança da(s) pessoa(s) devem ser preservados **EXATAMENTE**. Elas precisam ser perfeitamente reconhecíveis. Não altere os rostos.

Se houver várias pessoas, transforme cada uma em um personagem apropriado do filme/série.

Retorne **apenas** a imagem final.`;

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
        responseModalities: [Modality.IMAGE, Modality.TEXT],
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
