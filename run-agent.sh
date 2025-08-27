#!/bin/bash

# Dacras AI - Claude Code Agent Runner
# Quick launcher for specialized development agents

echo "🎬 Dacras AI - Claude Code Agents"
echo "================================="
echo ""
echo "Select an agent to run:"
echo ""
echo "1. 🖥️  Frontend Integration Agent - Connect frontend/backend, test components"
echo "2. 🧪  API Testing Agent - Test all API endpoints + Texel.ai integration"  
echo "3. 🎬  Video Processing Agent - Implement video generation with Texel.ai"
echo "4. 🖼️  Image Generation Agent - Add AI image generation features"
echo "5. 🔗  Integration & QA Agent - End-to-end testing, quality assurance"
echo "6. 🚀  DevOps & Monitoring Agent - Deployment, monitoring, infrastructure"
echo ""
echo "0. 📚  View full agent documentation"
echo ""
read -p "Enter your choice (0-6): " choice

case $choice in
    1)
        echo ""
        echo "🖥️  Starting Frontend Integration Agent..."
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are a Frontend Integration Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras\""
        echo ""
        echo "PRIMARY TASKS:"
        echo "1. Connect React frontend (port 3001) with Node.js backend API (port 3000)"
        echo "2. Implement API client functions for all backend endpoints"
        echo "3. Add proper error handling and loading states"
        echo "4. Create API hook utilities using React Query or SWR"
        echo "5. Test all frontend components thoroughly"
        echo "6. Implement real-time status updates for video generation"
        echo "7. Add form validation and user feedback systems"
        echo "8. Optimize component performance and bundle size"
        echo ""
        echo "Always use the codebase structure and maintain consistency with existing patterns."
        ;;
    2)
        echo ""
        echo "🧪  Starting API Testing Agent..."
        echo "📚  IMPORTANT: This agent will use the API reference documentation"
        echo "    Location: docs/API_REFERENCE.md"
        echo "    Includes: Dacras API + Texel.ai integration specs"
        echo ""
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are an API Testing Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras/backend\""
        echo ""
        echo "API REFERENCE: Read \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras/docs/API_REFERENCE.md\" for complete API specifications."
        echo ""
        echo "Create comprehensive test suites for ALL Dacras API endpoints AND Texel.ai integration points. Ensure 95%+ test coverage."
        ;;
    3)
        echo ""
        echo "🎬  Starting Video Processing Agent..."
        echo "📚  IMPORTANT: This agent integrates with Texel.ai API"
        echo "    API Docs: docs/API_REFERENCE.md (Texel.ai section)"
        echo "    Endpoints: Lip-sync, video generation, image processing"
        echo ""
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are a Video Processing Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras\""
        echo ""
        echo "API REFERENCE: Read \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras/docs/API_REFERENCE.md\" for Texel.ai integration specifications."
        echo ""
        echo "Implement robust video generation pipeline with complete Texel.ai integration and job management."
        ;;
    4)
        echo ""
        echo "🖼️  Starting Image Generation Agent..."
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are an Image Generation Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras\""
        echo ""
        echo "Implement AI image generation features with OpenAI integration and visual asset management."
        ;;
    5)
        echo ""
        echo "🔗  Starting Integration & QA Agent..."
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are an Integration & QA Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras\""
        echo ""
        echo "Perform end-to-end testing, system integration validation, and quality assurance processes."
        ;;
    6)
        echo ""
        echo "🚀  Starting DevOps & Monitoring Agent..."
        echo "Copy this prompt into Claude Code:"
        echo ""
        echo "claude --dangerously-skip-permissions"
        echo ""
        echo "You are a DevOps & Monitoring Specialist for the Dacras AI video ad generation platform. Use the Organized Codebase agent templates as your foundation."
        echo ""
        echo "CODEBASE LOCATION: \"/Users/supabowl/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/Dacras\""
        echo ""
        echo "Optimize production deployment, implement monitoring, and create scalable infrastructure."
        ;;
    0)
        echo ""
        echo "📚  Opening full agent documentation..."
        if command -v code &> /dev/null; then
            code "CLAUDE_CODE_AGENTS.md"
        elif command -v nano &> /dev/null; then
            nano "CLAUDE_CODE_AGENTS.md" 
        else
            cat "CLAUDE_CODE_AGENTS.md"
        fi
        ;;
    *)
        echo "Invalid choice. Please run the script again and select 0-6."
        ;;
esac

echo ""
echo "📚 Key Resources:"
echo "   • API Reference: docs/API_REFERENCE.md (Dacras + Texel.ai)"
echo "   • Agent Documentation: CLAUDE_CODE_AGENTS.md"
echo "   • Texel.ai Docs: https://api.prod.texel.ai/docs"
echo ""
echo "💡 Pro tip: Run agents in this recommended order:"
echo "   API Testing → Frontend Integration → Video Processing → Image Generation → Integration & QA → DevOps"
echo ""