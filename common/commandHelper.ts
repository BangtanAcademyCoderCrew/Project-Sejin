import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';

const addChannelOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('The channel')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread)
      .setRequired(required)
  );
};

const addChannelStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option.setName('channel').setDescription('The channel').setRequired(required)
  );
};

const addClassCodeStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option.setName('class_code').setDescription('The class code for the class').setRequired(required)
  );
};

const addDescriptionStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option.setName('description').setDescription('The description on the top of message').setRequired(required)
  );
};

const addHwDescriptionStringOption = (
  builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  required = false
) => {
  return builder.addStringOption((option) =>
    option
      .setName('hw_description')
      .setDescription("Description for each homework. Add 'number' to include the number. Eg: Assigment #'number'")
      .setRequired(required)
  );
};

const addNoMultiplesBooleanOption = (
  builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  required = false
) => {
  return builder.addBooleanOption((option) =>
    option
      .setName('no_multiples')
      .setDescription('Should not allow multiple entries from same student. Defaults to allow multiple entries.')
      .setRequired(required)
  );
};

const addStartDateStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option
      .setName('start_date')
      .setDescription('The first day to log in the logbook (Format YYYY/MM/DD)')
      .setRequired(required)
  );
};

const addStartTimeStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option
      .setName('start_time')
      .setDescription('Add the time for when to start looking homework (Format HH:MM)')
      .setRequired(required)
  );
};

const addEndDateStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option
      .setName('end_date')
      .setDescription('The last day to log in the logbook (Format YYYY/MM/DD)')
      .setRequired(required)
  );
};

const addEndTimeStringOption = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, required = false) => {
  return builder.addStringOption((option) =>
    option
      .setName('end_time')
      .setDescription('Add the time for when to stop looking homework (Format HH:MM)')
      .setRequired(required)
  );
};

const addLogHwOptions = (builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) => {
  addClassCodeStringOption(builder, true);
  addStartDateStringOption(builder, true);
  addStartTimeStringOption(builder, true);
  addEndDateStringOption(builder, true);
  addEndTimeStringOption(builder, true);
  addDescriptionStringOption(builder);
  addHwDescriptionStringOption(builder);
  addNoMultiplesBooleanOption(builder);
  return builder;
};

export {
  addChannelOption,
  addChannelStringOption,
  addClassCodeStringOption,
  addDescriptionStringOption,
  addHwDescriptionStringOption,
  addNoMultiplesBooleanOption,
  addStartDateStringOption,
  addStartTimeStringOption,
  addEndDateStringOption,
  addEndTimeStringOption,
  addLogHwOptions
};
