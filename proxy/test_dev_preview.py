import tempfile
import textwrap
import unittest
from pathlib import Path

from proxy import dev_preview


class DevPreviewTests(unittest.TestCase):
    def test_static_asset_path_resolves_avatar_svg(self):
        asset = dev_preview.static_asset_path("/avatar.svg")

        self.assertEqual(asset, dev_preview.PROXY_DIR / "avatar.svg")

    def test_static_asset_path_ignores_query_string(self):
        asset = dev_preview.static_asset_path("/favicon.ico?v=20260615")

        self.assertEqual(asset, dev_preview.PROXY_DIR / "favicon.ico")

    def test_static_asset_path_ignores_template_routes(self):
        self.assertIsNone(dev_preview.static_asset_path("/no-music"))

    def test_repository_config_renders_current_template(self):
        html = dev_preview.render_template(no_music=True)

        self.assertIn("RoyenHeart's Space", html)
        self.assertIn("referenceCubeCloud", html)
        self.assertIn("#01e8fe", html)
        self.assertNotRegex(html, r"\{\{[A-Z0-9_]+\}\}")

    def test_render_template_replaces_openresty_placeholders(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            config_path = root / "config.toml"
            template_path = root / "template.html"

            config_path.write_text(
                textwrap.dedent(
                    """
                    [meta]
                    title = "Preview Title"
                    beian_icp = "ICP"
                    beian_police = "Police"

                    [links]
                    blog = "https://blog.example"
                    github = "https://github.example"

                    [music]
                    iframe = '''<iframe src="//music.example"></iframe>'''

                    [visual]
                    bg_color = "#01e8fe"
                    cube_color = "#56dfff"
                    highlight_color = "#ff4f8f"
                    ambient_color = "#1e7dff"
                    """
                ).strip(),
                encoding="utf-8",
            )
            template_path.write_text(
                "{{TITLE}} {{BEIAN_ICP}} {{BEIAN_POLICE}} {{LINK_BLOG}} "
                "{{LINK_GITHUB}} {{MUSIC_IFRAME}} {{COLOR_BG}} {{COLOR_CUBE}} "
                "{{COLOR_HIGHLIGHT}} {{COLOR_AMBIENT}}",
                encoding="utf-8",
            )

            html = dev_preview.render_template(config_path, template_path)

            self.assertIn("Preview Title", html)
            self.assertIn("https://blog.example", html)
            self.assertIn('<iframe src="//music.example"></iframe>', html)
            self.assertIn("#01e8fe", html)
            self.assertNotIn("{{", html)

    def test_render_template_can_disable_music_iframe(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            config_path = root / "config.toml"
            template_path = root / "template.html"

            config_path.write_text(
                textwrap.dedent(
                    """
                    [meta]
                    title = "Preview Title"
                    beian_icp = "ICP"
                    beian_police = "Police"

                    [links]
                    blog = "https://blog.example"
                    github = "https://github.example"

                    [music]
                    iframe = '''<iframe src="//music.example"></iframe>'''

                    [visual]
                    bg_color = "#01e8fe"
                    cube_color = "#56dfff"
                    highlight_color = "#ff4f8f"
                    ambient_color = "#1e7dff"
                    """
                ).strip(),
                encoding="utf-8",
            )
            template_path.write_text("{{TITLE}} {{MUSIC_IFRAME}}", encoding="utf-8")

            html = dev_preview.render_template(config_path, template_path, no_music=True)

            self.assertIn("Preview Title", html)
            self.assertNotIn("<iframe", html)


if __name__ == "__main__":
    unittest.main()
