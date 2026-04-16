const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const CSV = require('csv-string');

const analyzeRFP = async (req, res) => {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;

    let { documentText, targetPageCount = 10 } = req.body;
    
    // Handle File Upload if present
    if (req.file) {
      const buffer = req.file.buffer;
      const mimetype = req.file.mimetype;

      if (mimetype === 'application/pdf') {
        try {
          if (typeof pdf === 'function') {
            const data = await pdf(buffer);
            documentText = data.text;
          } else if (pdf.PDFParse) {
            const parser = new pdf.PDFParse({ data: buffer });
            const result = await parser.getText();
            documentText = result.text;
            await parser.destroy();
          } else {
            throw new Error('PDF parsing library not initialized correctly');
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error(`Failed to parse PDF: ${pdfError.message}`);
        }
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer });
        documentText = data.value;
      } else if (mimetype === 'text/csv' || mimetype === 'application/vnd.ms-excel') {
        documentText = buffer.toString('utf-8');
      } else if (mimetype.startsWith('text/')) {
        documentText = buffer.toString('utf-8');
      } else {
        return res.status(400).json({ error: 'Unsupported file format. Please upload PDF, Word, or CSV.' });
      }
    }

    if (!documentText || documentText.trim().length < 10) {
      return res.status(400).json({ error: 'Valid document text or file is required for analysis' });
    }

    // Estimate logical size
    const wordCount = documentText.split(/\s+/).length;
    const isLarge = wordCount > 2000;
    
    const getPrompt = (type) => {
      if (type === 'SUMMARIZATION') {
        return `
          You are an elite Enterprise Solutions Architect and AI Proposal summarizer. 
          Your task: Analyze the provided massive RFP document and distill it into a comprehensive, highly accurate ${targetPageCount} page Executive Summary.
          
          CRITICAL: The output MUST be formatted as a professional proposal with enough detail to fill approximately ${targetPageCount} pages if printed. 
          Expand on technical requirements, architecture constraints, and risk factors deeply.
          
          Focus precisely on: Technical Requirements, Architecture Constraints, Compliance, Resource Allocation, and Risk Factors. 
          Strip all generic fluff and output a highly structured, professional markdown format.

          Document Content:
          ${documentText.substring(0, 50000)}
        `;
      } else {
        return `
          You are an elite Enterprise Solutions Architect and AI Proposal generator.
          Your task: Take this brief input and elaborate it into a massive, highly detailed ${targetPageCount} page Enterprise Proposal.
          
          CRITICAL: The output MUST be deep and detailed enough to span ${targetPageCount} pages of professional content. 
          You must logically infer missing technical requirements, design an optimal architecture, formulate resource allocations, and identify potential risk factors.
          
          Output a highly structured, professional markdown format that expands the small input into a masterclass proposal.

          Input Content:
          ${documentText}
        `;
      }
    };

    const analysisType = isLarge ? 'SUMMARIZATION' : 'ELABORATION';
    const finalPrompt = getPrompt(analysisType);

    // -----------------------------------------------------------------
    // 1. USE GROQ (PRIMARY)
    // -----------------------------------------------------------------
    const groqKey = process.env.GROQ_API_KEY;
    
    if (groqKey) {
      try {
        console.log(`[AI] Attempting ${analysisType} with GROQ (Llama-3.3-70b)...`);
        const groq = new Groq({ apiKey: groqKey });
        
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are an elite Enterprise Solutions Architect. You produce professional, high-fidelity markdown proposals." },
            { role: "user", content: finalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 4096,
        });

        const generatedText = response.choices[0]?.message?.content;

        if (generatedText) {
          console.log(`[AI] Groq Success!`);
          return res.status(200).json({
            success: true,
            engine: 'GROQ',
            analysisType,
            result: generatedText
          });
        }
      } catch (groqError) {
        console.warn(`[AI] Groq Error: ${groqError.message}`);
      }
    }

    // -----------------------------------------------------------------
    // 2. USE OPENAI (BACKUP)
    // -----------------------------------------------------------------
    if (openaiKey) {
      try {
        console.log(`[AI] Falling back to OpenAI (gpt-4o)...`);
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an elite Enterprise Solutions Architect. You produce professional, high-fidelity markdown proposals." },
            { role: "user", content: finalPrompt }
          ],
          temperature: 0.2,
          max_tokens: 4096,
        });
        const generatedText = response.choices[0]?.message?.content;
        if (generatedText) {
          return res.status(200).json({ success: true, engine: 'OPENAI', result: generatedText });
        }
      } catch (e) { console.warn("[AI] OpenAI Fallback also failed."); }
    }
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_api_key_here') {
      try {
        console.log(`[AI] Falling back to Gemini (via Google AI Studio)...`);
        const { GoogleGenAI } = require('@google/genai');
        const client = new GoogleGenAI({ apiKey: geminiKey });
        
        // Use 1.5 Flash as it is highly stable in the free tier
        const model = 'gemini-1.5-flash';
        const modelInstance = client.getGenerativeModel({ model });
        const result = await modelInstance.generateContent(finalPrompt);
        
        const generatedText = result.response.text();

        if (generatedText) {
          console.log(`[AI] Gemini Success!`);
          return res.status(200).json({
            success: true,
            engine: 'GEMINI',
            analysisType,
            result: generatedText
          });
        }
      } catch (geminiError) {
        console.error(`[AI] Gemini Fallback Failed: ${geminiError.message}`);
      }
    }

    // FINAL FALLBACK: DEVELOPMENT MOCK (Prevents blocking the user if all APIs fail)
    if (process.env.NODE_ENV === 'development') {
      console.log('----------------------------------------------');
      console.log('⚠️  NOTICE: ALL AI SERVICES ARE OFFLINE (Quota Exceeded)');
      console.log('💡 TIP: Returning high-fidelity MOCK PROPOSAL to keep development moving.');
      console.log('----------------------------------------------');
      
      const mockResult = `
# EXECUTIVE PROPOSAL: AI COMMAND CENTER TRANSFORMATION

## 1. STRATEGIC OVERVIEW
This initiative aims to modernize the RFP processing infrastructure using cloud-native services and advanced orchestration. By centralizing request management and implementing automated analysis, the organization can achieve a 40% reduction in proposal turnaround time.

## 2. KEY TECHNICAL REQUIREMENTS
- **High-Performance Compute:** Implementation on AWS/Azure with auto-scaling capabilities.
- **Data Security:** AES-256 encryption at rest with multi-region redundancy.
- **Compliance:** Full adherence to GDPR, SOC2, and ISO 27001 standards.
- **Scalability:** System must handle >500 concurrent complex document analyses.

## 3. PROPOSED ARCHITECTURE
### 3.1 Frontend Tier
React-based SPA featuring real-time state synchronization via WebSocket and optimized UI/UX following elite enterprise standards.

### 3.2 Logic Tier
Node.js microservices architecture providing robust REST APIs, horizontal scalability, and resilient error handling as demonstrated in the current implementation.

### 3.3 Persistence Tier
PostgreSQL (Neon) with optimized indexing for full-text search and complex relational queries.

## 4. IMPLEMENTATION ROADMAP
- **Phase 1 (Week 1-2):** Environment Setup & Security Hardening
- **Phase 2 (Week 3-6):** Document Parsing Engine & Core API Integration
- **Phase 3 (Week 7-10):** AI Orchestration & Evaluation Framework
- **Phase 4 (Week 11-12):** UAT & Performance Tuning

## 5. RISK MITIGATION
| Risk Factor | Probability | Mitigation Strategy |
|-------------|-------------|---------------------|
| API Latency | Medium | Implement aggressive Redis caching |
| Data Privacy| Low | Strict PII masking before third-party processing |
| Scale limits| Medium | Implement request queuing & background processing |

---
*Note: This response was generated by the System Mock Fallback because connected AI services (OpenAI, Gemini, Claude) currently report insufficient quota.*
      `;

      return res.status(200).json({
        success: true,
        engine: 'MOCK_ENGINE',
        analysisType,
        result: mockResult.trim()
      });
    }

    throw new Error('No valid AI engine configuration found or all quotas exceeded.');

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      error: 'Failed to complete AI analysis', 
      details: error.message
    });
  }
};

module.exports = {
  analyzeRFP
};
