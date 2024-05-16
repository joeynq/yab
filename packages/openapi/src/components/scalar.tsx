export const ScalarPage = ({ url, title }: { url: string; title?: string }) => {
	return (
		<html lang="en">
			<head>
				{title && <title>{title}</title>}
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>
				<script id="api-reference" type="application/json" data-url={url} />
				<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference" />
			</body>
		</html>
	);
};
