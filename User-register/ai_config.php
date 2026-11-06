<?php
declare(strict_types=1);
// This file is loaded by help_ai.php. Direct browser access is blocked by the internal guard.
if (!defined('NIG_INTERNAL')) {
    http_response_code(404);
    exit;
}

// Paste ONE provider key between the quotes. Keep this file private and never upload it to GitHub.
// Google Gemini: https://aistudio.google.com/app/apikey
// OpenAI: https://platform.openai.com/api-keys
const NIG_GEMINI_API_KEY = '';
const NIG_OPENAI_API_KEY = '';
