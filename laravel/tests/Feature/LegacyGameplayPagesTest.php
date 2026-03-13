<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class LegacyGameplayPagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            session_write_close();
        }

        $_COOKIE['PHPSESSID'] = bin2hex(random_bytes(16));
    }

    public function test_idle_page_renders_from_laravel_view_layer(): void
    {
        $response = $this->get('/idle.php');

        $response
            ->assertOk()
            ->assertSee('Код и Кофе', false)
            ->assertSee('stdout:', false);
    }

    public function test_idle_page_renders_logged_in_username(): void
    {
        $response = $this
            ->withSession([
                'user_id' => 42,
                'username' => 'tester',
                '_csrf_token' => 'bridge-token',
            ])
            ->get('/idle.php');

        $response
            ->assertOk()
            ->assertSee('tester', false)
            ->assertSee('Магазин престижа', false);
    }

    public function test_dungeon_page_renders_bonus_block_for_logged_in_user(): void
    {
        $response = $this
            ->withSession([
                'user_id' => 42,
                'username' => 'tester',
                '_csrf_token' => 'bridge-token',
            ])
            ->get('/dungeon.php');

        $response
            ->assertOk()
            ->assertSee('Выбери класс', false)
            ->assertSee('Уровень аккаунта', false);
    }

    public function test_minigame_page_renders_guest_note(): void
    {
        $response = $this->get('/minigame.php');

        $response
            ->assertOk()
            ->assertSee('Охота на Баги', false)
            ->assertSee('Войди чтобы сохранить награду в игру', false);
    }

    public function test_story_game_page_renders_start_scene(): void
    {
        $response = $this->get('/game.php');

        $response
            ->assertOk()
            ->assertSee('День программиста', false)
            ->assertSee('Начать рабочий день', false);
    }

    public function test_season_one_vertical_slice_page_renders_separately_from_idle(): void
    {
        $response = $this->get('/season1.php');

        $response
            ->assertOk()
            ->assertSee('Season 1: Скуф-пати', false)
            ->assertSee('/season1.php', false)
            ->assertSee('Выбери один главный шаг', false);
    }
}
