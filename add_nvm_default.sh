
# Check if the nvm default line already exists
if ! grep -q "nvm use 16" ~/.zshrc; then
  # Append the nvm default setting to .zshrc
  echo "" >> ~/.zshrc
  echo "# Set default Node.js version to 16" >> ~/.zshrc
  echo "nvm use 16 &>/dev/null || true  # Silently try to use Node.js 16" >> ~/.zshrc
  echo "Added Node.js 16 default setting to your ~/.zshrc file"
else
  echo "Node.js 16 default setting already exists in your ~/.zshrc file"
fi

