# get base sdk image from microsoft
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as build-env
WORKDIR /app

# copy CSPROJ file and restore dependencies(via NUGET)
COPY *.csproj ./
RUN dotnet restore

# copy project files and build release
COPY . ./
RUN dotnet publish -c Release -o out

# generate runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
#EXPOSE 443
COPY --from=build-env /app/out .
#ENTRYPOINT ["dotnet", "DockerTest.dll"]
CMD ["dotnet", "DockerTest.dll"]