export class SlackChannelService {
  private appClient: any;
  constructor(appClient: any) {
    this.appClient = appClient.client ?? appClient;
  }

  async findChannelIdByName(channelName: string): Promise<string | null> {
    try {
      const cleanChannelName = channelName.replace(/^#/, "");
      const result = await this.appClient.conversations.list({
        types: "public_channel",
      });
      const channel = result.channels.find(
        (c: any) => c.name === cleanChannelName
      );
      return channel ? channel.id : null;
    } catch (error) {
      console.error(`Failed to find channel by name ${channelName}:`, error);
      return null;
    }
  }
}
